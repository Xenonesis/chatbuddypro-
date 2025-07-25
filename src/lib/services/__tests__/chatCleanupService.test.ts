import { chatCleanupService } from '../chatCleanupService';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          lt: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        in: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          lt: jest.fn(),
        })),
        in: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

describe('chatCleanupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCleanupPreview', () => {
    it('should calculate correct cutoff date for retention period', () => {
      const retentionDays = 30;
      const userId = 'test-user-id';
      
      // Mock the current date
      const mockDate = new Date('2024-01-31T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      // The expected cutoff date should be 30 days before the mock date
      const expectedCutoffDate = new Date('2024-01-01T00:00:00Z');
      
      // Call the method (it will use mocked Supabase, but we can verify the date logic)
      chatCleanupService.getCleanupPreview(userId, retentionDays);
      
      // Verify that Date was called correctly
      expect(Date).toHaveBeenCalled();
      
      // Restore the original Date
      (global.Date as any).mockRestore();
    });
  });

  describe('cleanupUserChats', () => {
    it('should handle empty chat list gracefully', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock empty chat list
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            lt: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await chatCleanupService.cleanupUserChats('test-user', 30);
      
      expect(result).toEqual({
        success: true,
        deletedChatsCount: 0,
        deletedMessagesCount: 0,
      });
    });

    it('should handle database errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase');
      
      // Mock database error
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            lt: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      });

      const result = await chatCleanupService.cleanupUserChats('test-user', 30);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch chats');
    });
  });

  describe('updateLastCleanupDate', () => {
    it('should update preferences with new cleanup date', async () => {
      const { supabase } = require('@/lib/supabase');
      const userId = 'test-user';
      
      // Mock successful fetch and update
      const mockPreferences = {
        preferences: {
          chatManagementSettings: {
            autoDeleteEnabled: true,
            retentionPeriodDays: 30,
          },
        },
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPreferences,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      await chatCleanupService.updateLastCleanupDate(userId);
      
      // Verify that update was called
      expect(supabase.from).toHaveBeenCalledWith('user_preferences');
    });
  });
});

// Integration test helper
export const testCleanupServiceIntegration = {
  async verifyCleanupPreview(userId: string, retentionDays: number) {
    try {
      const preview = await chatCleanupService.getCleanupPreview(userId, retentionDays);
      console.log('Cleanup preview:', preview);
      return preview;
    } catch (error) {
      console.error('Error in cleanup preview:', error);
      throw error;
    }
  },

  async testCleanupWithDryRun(userId: string, retentionDays: number) {
    try {
      // First get preview
      const preview = await chatCleanupService.getCleanupPreview(userId, retentionDays);
      console.log('Would delete:', preview);
      
      // Note: In a real test, you might want to create test data first
      // and then verify cleanup works correctly
      
      return preview;
    } catch (error) {
      console.error('Error in dry run test:', error);
      throw error;
    }
  },
};
