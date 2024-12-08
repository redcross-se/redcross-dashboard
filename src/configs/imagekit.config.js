import axios from "axios";

export const uploadProfilePicture = async (file) => {
  const form = new FormData();
  form.append("file", file);
  form.append("fileName", file.name);
  form.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
  form.append("signature", import.meta.env.VITE_IMAGEKIT_SIGNATURE);
  form.append("expire", import.meta.env.VITE_IMAGEKIT_EXPIRE);
  form.append("token", import.meta.env.VITE_IMAGEKIT_TOKEN);
  form.append("useUniqueFileName", true);
  form.append("tags", "profile-picture");
  form.append("folder", "/profile_pictures/");
  form.append("isPrivateFile", false);
  form.append("isPublished", true);
  form.append("responseFields", "filePath, url");

  const options = {
    method: "POST",
    url: "https://upload.imagekit.io/api/v1/files/upload",
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Basic ${import.meta.env.VITE_IMAGEKIT_AUTHORIZATION}`,
    },
    data: form,
  };

  try {
    const { data } = await axios.request(options);
    return data;
  } catch (error) {
    throw error;
  }
};
