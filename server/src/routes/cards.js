import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

function formatCard(card) {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    columnId: card.columnId,
    order: card.order,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

async function findCardForUser(cardId, userId) {
  return prisma.card.findFirst({
    where: {
      id: cardId,
      column: { board: { userId } },
    },
  });
}

async function findColumnForUser(columnId, userId) {
  return prisma.column.findFirst({
    where: {
      id: columnId,
      board: { userId },
    },
  });
}

router.get('/', async (req, res, next) => {
  try {
    const { columnId } = req.query;

    if (!columnId) {
      return res.status(400).json({ success: false, message: 'columnId query parameter is required' });
    }

    const column = await findColumnForUser(columnId, req.user.userId);

    if (!column) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }

    const cards = await prisma.card.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      data: cards.map(formatCard),
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
      (item) => item.id && item.columnId && typeof item.order === 'number',
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Each item must include id, columnId and order',
      });
    }

    const cardIds = items.map((item) => item.id);
    const cards = await prisma.card.findMany({
      where: {
        id: { in: cardIds },
        column: { board: { userId: req.user.userId } },
      },
    });

    if (cards.length !== items.length) {
      return res.status(404).json({ success: false, message: 'One or more cards not found' });
    }

    const columnIds = [...new Set(items.map((item) => item.columnId))];
    const columns = await prisma.column.findMany({
      where: {
        id: { in: columnIds },
        board: { userId: req.user.userId },
      },
    });

    if (columns.length !== columnIds.length) {
      return res.status(404).json({ success: false, message: 'One or more target columns not found' });
    }

    const updatedCards = await prisma.$transaction(
      items.map((item) =>
        prisma.card.update({
          where: { id: item.id },
          data: {
            columnId: item.columnId,
            order: item.order,
          },
        }),
      ),
    );

    res.json({
      success: true,
      message: 'Card order updated successfully',
      data: updatedCards.map(formatCard),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const card = await findCardForUser(req.params.id, req.user.userId);

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    res.json({
      success: true,
      data: formatCard(card),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, columnId, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!columnId) {
      return res.status(400).json({ success: false, message: 'columnId is required' });
    }

    const column = await findColumnForUser(columnId, req.user.userId);

    if (!column) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }

    let cardOrder = order;

    if (typeof cardOrder !== 'number') {
      const lastCard = await prisma.card.findFirst({
        where: { columnId },
        orderBy: { order: 'desc' },
      });

      cardOrder = lastCard ? lastCard.order + 1 : 0;
    }

    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        columnId,
        order: cardOrder,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: formatCard(card),
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, columnId, order } = req.body;

    const existingCard = await findCardForUser(req.params.id, req.user.userId);

    if (!existingCard) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (columnId) {
      const column = await findColumnForUser(columnId, req.user.userId);

      if (!column) {
        return res.status(404).json({ success: false, message: 'Column not found' });
      }
    }

    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        ...(columnId && { columnId }),
        ...(typeof order === 'number' && { order }),
      },
    });

    res.json({
      success: true,
      message: 'Card updated successfully',
      data: formatCard(card),
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existingCard = await findCardForUser(req.params.id, req.user.userId);

    if (!existingCard) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    await prisma.card.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
