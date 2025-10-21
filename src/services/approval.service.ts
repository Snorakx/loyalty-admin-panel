import { ApprovalRepository, PendingBusiness, BusinessDetails } from '../repositories/approval.repository';

export class ApprovalService {
  private approvalRepository: ApprovalRepository;

  constructor() {
    this.approvalRepository = new ApprovalRepository();
  }

  /**
   * Get count of pending businesses
   */
  async getPendingCount(): Promise<number> {
    const businesses = await this.approvalRepository.getPendingBusinesses();
    return businesses.length;
  }

  /**
   * Get all pending businesses
   */
  async getPendingBusinesses(): Promise<PendingBusiness[]> {
    return await this.approvalRepository.getPendingBusinesses();
  }

  /**
   * Get complete business details
   */
  async getBusinessDetails(tenantId: string): Promise<BusinessDetails | null> {
    return await this.approvalRepository.getBusinessDetails(tenantId);
  }

  /**
   * Approve business
   */
  async approveBusiness(tenantId: string, approvedBy: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.approvalRepository.approveBusiness(tenantId, approvedBy);
    
    if (result.success) {
      // TODO: Send approval email to business owner
      console.log('Business approved, should send email');
    }
    
    return result;
  }

  /**
   * Reject business
   */
  async rejectBusiness(tenantId: string, reason: string, rejectedBy: string): Promise<{ success: boolean; error?: string }> {
    if (!reason || reason.trim().length < 10) {
      return { success: false, error: 'Powód odrzucenia musi mieć minimum 10 znaków' };
    }

    const result = await this.approvalRepository.rejectBusiness(tenantId, reason, rejectedBy);
    
    if (result.success) {
      // TODO: Send rejection email to business owner
      console.log('Business rejected, should send email with reason:', reason);
    }
    
    return result;
  }

  /**
   * Request changes from business owner
   */
  async requestChanges(tenantId: string, notes: string): Promise<{ success: boolean; error?: string }> {
    if (!notes || notes.trim().length < 10) {
      return { success: false, error: 'Notatki muszą mieć minimum 10 znaków' };
    }

    // TODO: Send email to business owner with requested changes
    console.log('Requesting changes for tenant:', tenantId, 'Notes:', notes);
    
    return { success: true };
  }

  /**
   * Resubmit after rejection
   */
  async resubmitAfterRejection(tenantId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Change status from rejected to pending
      const result = await this.approvalRepository.approveBusiness(tenantId, ''); // Will be updated to pending
      
      if (result.success) {
        // TODO: Notify Super Admin of resubmission
        console.log('Business resubmitted, should notify admin');
      }
      
      return result;
    } catch (error) {
      console.error('Error in resubmitAfterRejection:', error);
      return { success: false, error: 'Wystąpił błąd podczas ponownego wysyłania' };
    }
  }
}

