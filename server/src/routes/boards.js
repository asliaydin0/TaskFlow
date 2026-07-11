import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

function formatBoard(board) {
  return {
    id: board.id,
    title: board.title,
    userId: board.userId,
    createdAt: board.createdAt,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const boards = await prisma.board.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: boards.map(formatBoard),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    res.json({
      success: true,
      data: formatBoard(board),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      data: formatBoard(board),
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const existingBoard = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!existingBoard) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: { title: title.trim() },
    });

    res.json({
      success: true,
      message: 'Board updated successfully',
      data: formatBoard(board),
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existingBoard = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!existingBoard) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    await prisma.board.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Board deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
