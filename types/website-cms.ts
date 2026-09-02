export type PublishStatus = "draft" | "published";

export type FixedContent = {
  id: string;
  key: string;
  status: PublishStatus;
  data: Record<string, unknown>;
  updatedAt?: unknown;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  sortOrder: number;
  status: PublishStatus;
};
