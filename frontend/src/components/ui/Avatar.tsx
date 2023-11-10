import { FC } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { defaultProfilePictures } from '@/assets/images/defaultProfilePictures';
import { defaultGroupPictures } from '@/assets/images/defaultGroupPictures';
import { twMerge } from 'tailwind-merge';

const Fallback: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-full w-full p-2 text-zinc-500"
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
      clipRule="evenodd"
    />
  </svg>
);

const formatPicURL = (profilePictureUrl?: string) => {
  if (!profilePictureUrl) {
    return;
  }

  const defaultPpRegEx = /^default_[0-9]$/i;
  if (profilePictureUrl.match(defaultPpRegEx)) {
    const num = profilePictureUrl.replace('default_', '');
    const pictureNumber = Number(num);
    return defaultProfilePictures[pictureNumber];
  }

  const defaultGroupPicRegEx = /^default_group_[0-9]$/i;
  if (profilePictureUrl.match(defaultGroupPicRegEx)) {
    const num = profilePictureUrl.replace('default_group_', '');
    const pictureNumber = Number(num);
    return defaultGroupPictures[pictureNumber];
  }

  return profilePictureUrl;
};

type AvatarProps = {
  imgUrl?: string;
  alt?: string;
  className?: string;
  fallbackDelay?: number;
};

export const Avatar: FC<AvatarProps> = ({
  imgUrl,
  alt,
  className,
  fallbackDelay = 600,
}) => {
  return (
    <AvatarPrimitive.Root
      className={twMerge(
        'inline-flex h-10 min-h-[2.5rem] w-10 min-w-[2.5rem] select-none items-center justify-center overflow-hidden rounded-full bg-zinc-100 align-middle',
        className
      )}
    >
      <AvatarPrimitive.Image
        src={formatPicURL(imgUrl)}
        alt={alt}
        className="h-full w-full rounded-full object-cover"
      />
      <AvatarPrimitive.Fallback delayMs={fallbackDelay}>
        <Fallback />
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};
