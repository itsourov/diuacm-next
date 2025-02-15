import { UserListItem } from '../types';
import UserCard from './UserCard';

type UserGridProps = {
    users: UserListItem[];
}

export default function UserGrid({ users }: UserGridProps) {
    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
}
