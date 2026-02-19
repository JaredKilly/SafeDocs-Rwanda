import { Request, Response } from 'express';
import { Waitlist } from '../models';

/**
 * Join the waitlist - public endpoint
 */
export const joinWaitlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    const [entry] = await Waitlist.findOrCreate({
      where: { email: trimmedEmail },
      defaults: {
        email: trimmedEmail,
        name: name && typeof name === 'string' ? name.trim() : undefined,
      },
    });

    res.status(201).json({
      message: "You're on the list! We'll notify you when we launch.",
      email: entry.email,
    });
  } catch (error) {
    console.error('Join waitlist error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
