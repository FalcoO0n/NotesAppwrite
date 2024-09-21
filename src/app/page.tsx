import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Bill Splitter</h1>
      <p className="mb-8">Easily split bills with friends and keep track of expenses.</p>
      <div className="space-x-4">
        <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Login
        </Link>
        <Link href="/signup" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Sign Up
        </Link>
      </div>
    </div>
  )
}
