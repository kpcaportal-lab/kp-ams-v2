-- Migration: Add more assignment categories (I, J, K)
-- Description: Add Direct (Standard), Direct (Special), and Direct (Private)

ALTER TYPE assignment_category ADD VALUE IF NOT EXISTS 'I';
ALTER TYPE assignment_category ADD VALUE IF NOT EXISTS 'J';
ALTER TYPE assignment_category ADD VALUE IF NOT EXISTS 'K';
