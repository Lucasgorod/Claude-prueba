import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionService } from '../sessionService';
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

describe('sessionService', () => {
  it('creates a session', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: { id: 'sess1' }, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    fromMock.mockReturnValueOnce({ insert: insertMock });

    vi.spyOn(sessionService as any, 'generateUniqueCode').mockResolvedValue('ABC123');

    const id = await sessionService.createSession('quiz1', 'teacher1');

    expect(id).toBe('sess1');
    expect(fromMock).toHaveBeenCalledWith('sessions');
    expect(insertMock.mock.calls[0][0][0]).toEqual(expect.objectContaining({ quiz_id: 'quiz1', code: 'ABC123', created_by: 'teacher1' }));
  });

  it('adds a participant', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: { id: 'part1' }, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    fromMock.mockReturnValueOnce({ insert: insertMock });

    vi.spyOn(sessionService as any, 'updateSessionParticipantCount').mockResolvedValue(undefined);

    const participant = { name: 'John', status: 'connected', currentQuestionIndex: 0, score: 0, sessionId: 'sess1', id: '' };
    const id = await sessionService.addParticipant('sess1', participant);

    expect(id).toBe('part1');
    expect(fromMock).toHaveBeenCalledWith('participants');
    expect(insertMock.mock.calls[0][0][0]).toEqual(expect.objectContaining({ name: 'John', session_id: 'sess1' }));
  });
});
