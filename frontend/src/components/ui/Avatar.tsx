import { FC } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { defaultProfilePictures } from '@/assets/images/defaultProfilePictures';
import { defaultGroupPictures } from '@/assets/images/defaultGroupPictures';

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
};

export const Avatar: FC<AvatarProps> = ({ imgUrl, alt }) => {
  return (
    <AvatarPrimitive.Root className="inline-flex h-10 w-10 select-none items-center justify-center overflow-hidden rounded-full bg-zinc-100 align-middle">
      <AvatarPrimitive.Image
        src={formatPicURL(imgUrl)}
        alt={alt}
        className="h-full w-full rounded-full object-cover"
      />
      <AvatarPrimitive.Fallback delayMs={600}>XX</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};
