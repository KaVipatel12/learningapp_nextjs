'use client';

type Props = {
  isoString: string;
};

export default function FormattedDate({ isoString }: Props) {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return (
    <>
      <p className="text-sm text-gray-600">Account Created: {formattedDate}</p>
      <p className="text-sm text-gray-600">Time: {formattedTime}</p>
    </>
  );
}
