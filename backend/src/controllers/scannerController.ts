import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// ---------- list connected WIA scanners ----------
export const listScanners = async (req: Request, res: Response): Promise<void> => {
  if (process.platform !== 'win32') {
    res.json({ scanners: [], message: 'Scanner detection only supported on Windows.' });
    return;
  }

  const ps = `
    try {
      $dm = New-Object -ComObject WIA.DeviceManager
      $list = @()
      for ($i = 1; $i -le $dm.DeviceInfos.Count; $i++) {
        $di = $dm.DeviceInfos.Item($i)
        if ($di.Type -eq 1) {
          $name = ''
          try { $name = $di.Properties.Item('Name').Value } catch {}
          $list += [PSCustomObject]@{ id = $di.DeviceID; name = $name }
        }
      }
      $list | ConvertTo-Json -Compress
    } catch {
      Write-Output '[]'
    }
  `;

  try {
    const { stdout } = await execAsync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`, { timeout: 8000 });
    const raw = stdout.trim();
    let scanners: { id: string; name: string }[] = [];

    if (raw && raw !== '[]') {
      const parsed = JSON.parse(raw);
      // PowerShell ConvertTo-Json returns object (not array) when single item
      scanners = Array.isArray(parsed) ? parsed : [parsed];
    }

    res.json({ scanners });
  } catch (err) {
    console.error('listScanners error:', err);
    res.json({ scanners: [], error: 'Could not enumerate scanners.' });
  }
};

// ---------- trigger a scan from a WIA device ----------
export const scanFromDevice = async (req: Request, res: Response): Promise<void> => {
  if (process.platform !== 'win32') {
    res.status(400).json({ error: 'Scanner scanning only supported on Windows.' });
    return;
  }

  const { deviceId, colorMode = 4, dpi = 300 } = req.body;

  if (!deviceId) {
    res.status(400).json({ error: 'deviceId is required' });
    return;
  }

  const tmpFile = path.join(os.tmpdir(), `scan_${Date.now()}.jpg`);

  // colorMode: 1 = B&W, 2 = Grayscale, 4 = Color (WIA_IPA_DATATYPE)
  const ps = `
    try {
      $dm = New-Object -ComObject WIA.DeviceManager
      $di = $null
      for ($i = 1; $i -le $dm.DeviceInfos.Count; $i++) {
        if ($dm.DeviceInfos.Item($i).DeviceID -eq '${deviceId.replace(/'/g, "''")}') {
          $di = $dm.DeviceInfos.Item($i); break
        }
      }
      if (-not $di) { throw 'Scanner not found' }
      $device = $di.Connect()
      $item = $device.Items.Item(1)
      try { $item.Properties.Item(4103).Value = ${colorMode} } catch {}
      try { $item.Properties.Item(6147).Value = ${dpi} } catch {}
      try { $item.Properties.Item(6148).Value = ${dpi} } catch {}
      $imgFile = $item.Transfer('{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}')
      $imgFile.SaveFile('${tmpFile.replace(/\\/g, '\\\\')}')
      Write-Output 'ok'
    } catch {
      Write-Output "error: $_"
    }
  `;

  try {
    const { stdout } = await execAsync(
      `powershell -NoProfile -NonInteractive -Command "${ps.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
      { timeout: 30000 }
    );

    const result = stdout.trim();
    if (!result.startsWith('ok') || !fs.existsSync(tmpFile)) {
      res.status(500).json({ error: result || 'Scan failed — no output from scanner.' });
      return;
    }

    // Stream the scanned JPEG back to the client
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="scan_${Date.now()}.jpg"`);
    const stream = fs.createReadStream(tmpFile);
    stream.pipe(res);
    stream.on('end', () => {
      // Clean up temp file
      fs.unlink(tmpFile, () => {});
    });
    stream.on('error', () => {
      fs.unlink(tmpFile, () => {});
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read scanned file.' });
      }
    });
  } catch (err: any) {
    console.error('scanFromDevice error:', err);
    fs.unlink(tmpFile, () => {});
    res.status(500).json({ error: err.message || 'Scan failed.' });
  }
};
