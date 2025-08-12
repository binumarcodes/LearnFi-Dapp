'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import { AbstraxionProvider } from '@burnt-labs/abstraxion';
import '@burnt-labs/abstraxion/dist/index.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { AuthProvider } from '../context/AuthContext'; // 👈 Add this import
import './globals.css'


const inter = Inter({ subsets: ['latin'] });

const seatContractAddress =
  'xion1z70cvc08qv5764zeg3dykcyymj5z6nu4sqr7x8vl4zjef2gyp69s9mmdka';

const treasuryConfig = {
  treasury: 'xion13uwmwzdes7urtjyv7mye8ty6uk0vsgdrh2a2k94tp0yxx9vv3e9qazapyu',
  gasPrice: '0.001uxion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider> {/* 👈 Wrap with AuthProvider */}
            <AbstraxionProvider config={treasuryConfig}>
              {children}
            </AbstraxionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}