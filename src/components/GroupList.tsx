import Link from 'next/link'

interface Group {
  $id: string
  name: string
  members: string[]
}

interface GroupListProps {
  groups: Group[]
}

export default function GroupList({ groups }: GroupListProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Groups</h2>
      {groups.length === 0 ? (
        <p>You haven't joined any groups yet.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li key={group.$id} className="bg-white shadow rounded-lg p-4">
              <Link href={`/groups/${group.$id}`} className="text-blue-500 hover:text-blue-700">
                {group.name}
              </Link>
              <p className="text-gray-500 text-sm">{group.members.length} members</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}