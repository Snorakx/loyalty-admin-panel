import { OnboardingRepository, CreateBusinessData } from '../repositories/onboarding.repository';
import { validateNIPChecksum } from '../utils/nipValidation';
import { createLogger } from '../utils/logger';

export class OnboardingService {
  private onboardingRepository: OnboardingRepository;
  private logger = createLogger('OnboardingService');

  constructor() {
    this.onboardingRepository = new OnboardingRepository();
  }

  /**
   * Complete onboarding process
   */
  async completeOnboarding(data: CreateBusinessData): Promise<{ success: boolean; tenantId?: string; error?: string }> {
    this.logger.info('Starting onboarding process', { businessName: data.businessName });
    
    // Validate NIP if provided
    if (data.nip) {
      this.logger.debug('Validating NIP...', { nip: data.nip });
      
      if (!validateNIPChecksum(data.nip)) {
        this.logger.warn('NIP validation failed - invalid checksum', { nip: data.nip });
        return { success: false, error: 'Nieprawidłowy NIP (błędna suma kontrolna)' };
      }

      // Check for duplicate NIP
      const nipExists = await this.onboardingRepository.checkNIPDuplicate(data.nip);
      if (nipExists) {
        this.logger.warn('NIP validation failed - duplicate found', { nip: data.nip });
        return { success: false, error: 'Ten NIP jest już zarejestrowany w systemie' };
      }
      
      this.logger.debug('NIP validation passed');
    }

    // Check for similar business names (warning only, don't block)
    const similarNames = await this.onboardingRepository.checkBusinessNameDuplicate(data.businessName);
    if (similarNames.length > 0) {
      this.logger.warn('Similar business names found', { similarNames });
    }

    // Create business with all data
    this.logger.info('Creating business...');
    const result = await this.onboardingRepository.createBusinessWithOwner(data);
    
    if (result.success) {
      this.logger.success('Onboarding completed successfully', { tenantId: result.tenantId });
    } else {
      this.logger.error('Onboarding failed', result.error);
    }
    
    return result;
  }

  /**
   * Get profile completeness score (0-7)
   */
  async getProfileCompleteness(tenantId: string): Promise<number> {
    // This will be implemented when we have the SQL function
    // For now, return a placeholder
    return 5;
  }

  /**
   * Validate business data
   */
  validateBusinessData(data: Partial<CreateBusinessData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!data.businessName || data.businessName.length < 2) {
      errors.push('Nazwa biznesu jest wymagana (min. 2 znaki)');
    }
    if (!data.businessType) {
      errors.push('Typ biznesu jest wymagany');
    }
    if (!data.contactPerson || data.contactPerson.length < 2) {
      errors.push('Osoba kontaktowa jest wymagana');
    }
    if (!data.contactEmail) {
      errors.push('Email kontaktowy jest wymagany');
    }
    if (!data.contactPhone) {
      errors.push('Telefon kontaktowy jest wymagany');
    }
    if (!data.locationName || data.locationName.length < 2) {
      errors.push('Nazwa lokalizacji jest wymagana');
    }
    if (!data.locationAddress || data.locationAddress.length < 5) {
      errors.push('Adres lokalizacji jest wymagany');
    }
    if (!data.stampsRequired || data.stampsRequired < 3 || data.stampsRequired > 20) {
      errors.push('Liczba pieczątek musi być między 3 a 20');
    }
    if (!data.rewardDescription || data.rewardDescription.length < 3) {
      errors.push('Opis nagrody jest wymagany');
    }

    // Optional NIP validation
    if (data.nip && !validateNIPChecksum(data.nip)) {
      errors.push('Nieprawidłowy NIP');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

