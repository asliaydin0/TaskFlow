import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

function formatColumn(column) {
  return {
    id: column.id,
    title: column.title,
    boardId: column.boardId,
    order: column.order,
    createdAt: column.createdAt,
  };
}

async function findColumnForUser(columnId, userId) {
  return prisma.column.findFirst({
    where: {
      id: columnId,
      board: { userId },
    },
  });
}

async function findBoardForUser(boardId, userId) {
  return prisma.board.findFirst({
    where: {
      id: boardId,
      userId,
    },
  });
}

router.get('/', async (req, res, next) => {
  try {
    const { boardId } = req.query;

    if (!boardId) {
      return res.status(400).json({ success: false, message: 'boardId query parameter is required' });
    }

    const board = await findBoardForUser(boardId, req.user.userId);

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      data: columns.map(formatColumn),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/update-order', async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }

    const isValid = items.every(
      (item) => item.id && typeof item.order === 'number',
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Each item must include id and order',
      });
    }

    const columnIds = items.map((item) => item.id);
    const columns = await prisma.column.findMany({
      where: {
        id: { in: columnIds },
        board: { userId: req.user.userId },
      },
    });

    if (columns.length !== items.length) {
      return res.status(404).json({ success: false, message: 'One or more columns not found' });
    }

    const updatedColumns = await prisma.$transaction(
      items.map((item) =>
        prisma.column.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    res.json({
      success: true,
      message: 'Column order updated successfully',
      data: updatedColumns.map(formatColumn),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const column = await findColumnForUser(req.params.id, req.user.userId);

    if (!column) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }

    res.json({
      success: true,
      data: formatColumn(column),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, boardId, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!boardId) {
      return res.status(400).json({ success: false, message: 'boardId is required' });
    }

    const board = await findBoardForUser(boardId, req.user.userId);

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    let columnOrder = order;

    if (typeof columnOrder !== 'number') {
      const lastColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { order: 'desc' },
      });

      columnOrder = lastColumn ? lastColumn.order + 1 : 0;
    }

    const column = await prisma.column.create({
      data: {
        title: title.trim(),
        boardId,
        order: columnOrder,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Column created successfully',
      data: formatColumn(column),
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, order } = req.body;

    const existingColumn = await findColumnForUser(req.params.id, req.user.userId);

    if (!existingColumn) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const column = await prisma.column.update({
      where: { id: req.params.id },
      data: {
        title: title.trim(),
        ...(typeof order === 'number' && { order }),
      },
    });

    res.json({
      success: true,
      message: 'Column updated successfully',
      data: formatColumn(column),
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existingColumn = await findColumnForUser(req.params.id, req.user.userId);

    if (!existingColumn) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }

    await prisma.column.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Column deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
