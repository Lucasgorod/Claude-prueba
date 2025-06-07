import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quizService } from '../quizService';
import { supabase } from '../supabase';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

const fromMock = supabase.from as unknown as vi.Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('quizService', () => {
  it('creates a quiz', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: { id: 'quiz123' }, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    fromMock.mockReturnValueOnce({ insert: insertMock });

    const quiz = { title: 'Test', description: 'Desc', questions: [], createdBy: 'user1' };
    const id = await quizService.createQuiz(quiz);

    expect(id).toBe('quiz123');
    expect(fromMock).toHaveBeenCalledWith('quizzes');
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Test', description: 'Desc', created_by: 'user1' })
    ]);
    expect(selectMock).toHaveBeenCalledWith('id');
    expect(singleMock).toHaveBeenCalled();
  });

  it('updates a quiz', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValueOnce({ update: updateMock });

    await quizService.updateQuiz('id1', { title: 'New' });

    expect(fromMock).toHaveBeenCalledWith('quizzes');
    expect(updateMock.mock.calls[0][0]).toEqual(expect.objectContaining({ title: 'New' }));
    expect(eqMock).toHaveBeenCalledWith('id', 'id1');
  });
});
