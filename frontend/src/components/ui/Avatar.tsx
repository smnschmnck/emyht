import { defaultGroupPictures } from '@/assets/images/defaultGroupPictures';
import { defaultProfilePictures } from '@/assets/images/defaultProfilePictures';
import { FC } from 'react';

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
};

export const Avatar: FC<AvatarProps> = ({ imgUrl, alt }) => {
  return (
    <img
      src={formatPicURL(imgUrl)}
      alt={alt}
      className="max-h-11 min-h-11 min-w-11 max-w-11 rounded-full object-cover"
    />
  );
};
