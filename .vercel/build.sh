#!/bin/bash
# Install pnpm v8 globally
npm install -g pnpm@8

# Install dependencies using pnpm
pnpm install

# Run your build command (adjust if your build script is different)
pnpm run build
