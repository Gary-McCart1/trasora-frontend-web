export default function getS3Url(key?: string | null) {
    return key
      ? `https://dreamr-user-content.s3.amazonaws.com/${key}`
      : "/default-profilepic.png";
  }
  