import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Notification from '@/components/Notification'
import Providers from '../lib/providers'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bill Splitter App',
  description: 'A Next.js app for splitting bills among friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
        <header className="bg-blue-500 p-4">
          <div className="container mx-auto">
            <h1 className="text-white text-2xl font-bold">Bill Splitter</h1>
          </div>
        </header>
        <Navigation />
        <main className="container mx-auto mt-8">
          {children}
        </main>
          <Notification />
        </Providers>
      </body>
    </html>
  )
}
