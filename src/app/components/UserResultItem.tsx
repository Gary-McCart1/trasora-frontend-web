import Image from "next/image";
import Link from "next/link";
import getS3Url from "../utils/S3Url";

interface User {
  id: number;
  username: string;
  profilePictureUrl: string | null;
}

interface UserResultItemProps {
  user: User;
}

export default function UserResultItem({ user }: UserResultItemProps) {
  return (
    <Link href={`/profile/${user.username}`} key={user.id}>
      <li className="flex items-center gap-4 px-4 py-2 hover:bg-zinc-800 transition cursor-pointer">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={getS3Url(user.profilePictureUrl)}
            alt={user.username}
            width={512}
            height={512}
            className="object-cover w-full h-full"
          />
        </div>
        <span className="font-medium">{user.username}</span>
      </li>
    </Link>
  );
}
