'use client'

import { useState } from 'react'

interface CreateGroupFormProps {
  onCreateGroup: (name: string) => void
}

export default function CreateGroupForm({ onCreateGroup }: CreateGroupFormProps) {
  const [groupName, setGroupName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (groupName.trim()) {
      onCreateGroup(groupName.trim())
      setGroupName('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Create a New Group</h2>
      <div className="flex">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="flex-grow px-4 py-2 border rounded-l"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Create Group
        </button>
      </div>
    </form>
  )
}