import EditProfileModal from "./EditProfileModal";
import AccountSettingsModal from "./AccountSettingsModal";
import { User } from "../types/User";

interface ProfileModalsProps {
  isOwnProfile: boolean;
  isEditOpen: boolean;
  isModalOpen: boolean;
  onCloseEdit: () => void;
  onCloseSettings: () => void;
  onSave: (updatedUser: User) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  currentBio: string;
  currentProfilePic: string;
  currentAccentColor: string;
  currentProfilePublic: boolean; // Add this
  username: string; // Add username if needed
  onProfileVisibilityChange: (newValue: boolean) => void;
}


export default function ProfileModals({
  isOwnProfile,
  isEditOpen,
  isModalOpen,
  onCloseEdit,
  onCloseSettings,
  onSave,
  onLogout,
  onDeleteAccount,
  currentBio,
  currentProfilePic,
  currentAccentColor,
  currentProfilePublic, // Add this
  username, // Add this if needed
  onProfileVisibilityChange
}: ProfileModalsProps) {
  if (!isOwnProfile) return null;

  return (
    <>
      {isEditOpen && (
        <EditProfileModal
          currentBio={currentBio}
          currentProfilePic={currentProfilePic}
          currentAccentColor={currentAccentColor}
          currentProfilePublic={currentProfilePublic}
          onProfileVisibilityChange={onProfileVisibilityChange} // pass handler
          onClose={onCloseEdit}
          onSave={onSave}
          username={username}
        />
      )}
      {isModalOpen && (
        <AccountSettingsModal
          onClose={onCloseSettings}
          onLogout={onLogout}
        />
      )}
    </>
  );
}
