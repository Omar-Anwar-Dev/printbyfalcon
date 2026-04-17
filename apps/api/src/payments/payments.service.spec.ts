import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';

describe('PaymentsService.validateHmac', () => {
  let service: PaymentsService;

  // Stable mock Paymob body — fields in the same order the service concatenates them
  const sampleObj = {
    amount_cents: 19900,
    created_at: '2025-04-17T10:00:00Z',
    currency: 'EGP',
    error_occured: false,
    has_parent_transaction: false,
    id: 123456,
    integration_id: 111,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    order: { id: 'paymob-order-42' },
    owner: 77,
    pending: false,
    source_data: { pan: '1111', sub_type: 'card', type: 'card' },
    success: true,
  };

  const buildConcatenated = (obj: typeof sampleObj) => [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success,
  ].join('');

  const signWith = (secret: string, obj: typeof sampleObj) =>
    crypto.createHmac('sha512', secret).update(buildConcatenated(obj)).digest('hex');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: { payment: { findFirst: jest.fn() } } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: OrdersService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('accepts a correctly-signed body', () => {
    const secret = 'test-secret';
    const hmac = signWith(secret, sampleObj);
    // access private method
    const result = (service as any).validateHmac({ obj: sampleObj }, hmac, secret);
    expect(result).toBe(true);
  });

  it('rejects a body with altered amount', () => {
    const secret = 'test-secret';
    const hmac = signWith(secret, sampleObj);
    const tampered = { ...sampleObj, amount_cents: 100000 };
    const result = (service as any).validateHmac({ obj: tampered }, hmac, secret);
    expect(result).toBe(false);
  });

  it('rejects when signed with the wrong secret', () => {
    const hmac = signWith('attacker-secret', sampleObj);
    const result = (service as any).validateHmac({ obj: sampleObj }, hmac, 'real-secret');
    expect(result).toBe(false);
  });

  it('rejects an empty hmac param', () => {
    const result = (service as any).validateHmac({ obj: sampleObj }, '', 'test-secret');
    expect(result).toBe(false);
  });

  it('returns false (not throws) on malformed body', () => {
    const result = (service as any).validateHmac(null as any, 'anyhash', 'test-secret');
    expect(result).toBe(false);
  });
});
