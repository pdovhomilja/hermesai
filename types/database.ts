import {
  Prisma,
  User,
  Conversation,
  Message,
  Subscription,
} from "../lib/generated/prisma";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    spiritualProfile: true;
    preferences: true;
    subscriptions: true;
  };
}>;

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    messages: true;
    topics: {
      include: {
        topic: true;
      };
    };
  };
}>;

export type SubscriptionWithUsage = Prisma.SubscriptionGetPayload<{
  include: {
    usageRecords: true;
  };
}>;

export interface DatabaseError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}