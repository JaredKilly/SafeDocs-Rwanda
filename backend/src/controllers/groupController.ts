import { Request, Response } from 'express';
import { Group, GroupMember, User, AuditLog } from '../models';

/**
 * Create a new group
 */
export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    // Create the group
    const group = await Group.create({
      name,
      description: description || null,
      createdBy: req.user.userId
    });

    // Add creator as admin member
    await GroupMember.create({
      groupId: group.id,
      userId: req.user.userId,
      role: 'admin'
    });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      action: 'GROUP_CREATED',
      details: { groupId: group.id, groupName: group.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all groups (that user is a member of or created)
 */
export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get groups where user is a member
    const memberGroups = await GroupMember.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: Group,
          as: 'group',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'username', 'fullName']
            }
          ]
        }
      ]
    });

    const groups = memberGroups.map(gm => {
      const groupData = (gm as any).group ? (gm as any).group.toJSON ? (gm as any).group.toJSON() : (gm as any).group : {};
      return {
        ...groupData,
        userRole: gm.role
      };
    });

    res.status(200).json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get group by ID with members
 */
export const getGroupById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Check if user is a member of the group
    const membership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId: req.user.userId
      }
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Get group with all members
    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: GroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'email']
            }
          ]
        }
      ]
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.status(200).json({
      group,
      userRole: membership.role
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update group details
 */
export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { name, description } = req.body;

    // Check if user is an admin of the group
    const membership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId: req.user.userId,
        role: 'admin'
      }
    });

    if (!membership) {
      res.status(403).json({ error: 'Only group admins can update group details' });
      return;
    }

    const group = await Group.findByPk(id);

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Update group
    await group.update({
      name: name || group.name,
      description: description !== undefined ? description : group.description
    });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      action: 'GROUP_UPDATED',
      details: { groupId: group.id, groupName: group.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a group
 */
export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Check if user is an admin of the group
    const membership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId: req.user.userId,
        role: 'admin'
      }
    });

    if (!membership) {
      res.status(403).json({ error: 'Only group admins can delete the group' });
      return;
    }

    const group = await Group.findByPk(id);

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Delete all memberships first
    await GroupMember.destroy({ where: { groupId: id } });

    // Delete the group
    await group.destroy();

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      action: 'GROUP_DELETED',
      details: { groupId: id, groupName: group.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Add member to group
 */
export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { userId, role = 'member' } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Check if current user is an admin of the group
    const adminMembership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId: req.user.userId,
        role: 'admin'
      }
    });

    if (!adminMembership) {
      res.status(403).json({ error: 'Only group admins can add members' });
      return;
    }

    // Check if user exists
    const userToAdd = await User.findByPk(userId);
    if (!userToAdd) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user is already a member
    const existingMembership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId
      }
    });

    if (existingMembership) {
      res.status(400).json({ error: 'User is already a member of this group' });
      return;
    }

    // Add member
    const membership = await GroupMember.create({
      groupId: parseInt(id),
      userId,
      role
    });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      action: 'GROUP_MEMBER_ADDED',
      details: { groupId: id, addedUserId: userId, role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'Member added successfully',
      membership
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove member from group
 */
export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id, userId } = req.params;

    // Check if current user is an admin of the group
    const adminMembership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId: req.user.userId,
        role: 'admin'
      }
    });

    if (!adminMembership) {
      res.status(403).json({ error: 'Only group admins can remove members' });
      return;
    }

    // Find the membership to remove
    const membership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId
      }
    });

    if (!membership) {
      res.status(404).json({ error: 'Membership not found' });
      return;
    }

    // Don't allow removing the last admin
    if (membership.role === 'admin') {
      const adminCount = await GroupMember.count({
        where: {
          groupId: id,
          role: 'admin'
        }
      });

      if (adminCount <= 1) {
        res.status(400).json({ error: 'Cannot remove the last admin from the group' });
        return;
      }
    }

    // Remove member
    await membership.destroy();

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      action: 'GROUP_MEMBER_REMOVED',
      details: { groupId: id, removedUserId: userId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id, userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'member'].includes(role)) {
      res.status(400).json({ error: 'Valid role (admin or member) is required' });
      return;
    }

    // Check if current user is an admin of the group
    const adminMembership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId: req.user.userId,
        role: 'admin'
      }
    });

    if (!adminMembership) {
      res.status(403).json({ error: 'Only group admins can update member roles' });
      return;
    }

    // Find the membership to update
    const membership = await GroupMember.findOne({
      where: {
        groupId: id,
        userId
      }
    });

    if (!membership) {
      res.status(404).json({ error: 'Membership not found' });
      return;
    }

    // If demoting an admin, check they're not the last admin
    if (membership.role === 'admin' && role === 'member') {
      const adminCount = await GroupMember.count({
        where: {
          groupId: id,
          role: 'admin'
        }
      });

      if (adminCount <= 1) {
        res.status(400).json({ error: 'Cannot demote the last admin' });
        return;
      }
    }

    // Update role
    await membership.update({ role });

    // Log audit trail
    await AuditLog.create({
      userId: req.user.userId,
      action: 'GROUP_MEMBER_ROLE_UPDATED',
      details: { groupId: id, updatedUserId: userId, newRole: role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      message: 'Member role updated successfully',
      membership
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
