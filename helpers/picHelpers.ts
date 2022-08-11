import fallBackProfilePictureURL from '../assets/images/fallback-pp.webp'

export const formatPicURL = (profilePictureUrl?: string) => {
    if(!profilePictureUrl){
      return fallBackProfilePictureURL
    }
    const defaultPpRegeEx = /^default_[0-9]$/i;
    if (profilePictureUrl.match(defaultPpRegeEx)) {
      const num = profilePictureUrl.replace('default_', '');
      return '/default_profile_pictures/default_' + num + '.png';
    }
    return profilePictureUrl;
  };