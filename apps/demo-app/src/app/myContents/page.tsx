"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../components/util/firebase"; 
import { Button } from "../../components/ui/Button"

interface Content {
  id: string;
  title?: string;
  subject?: string;
  language?: string;
  videoUrl?: string;
  createdAt?: Timestamp;
}

export default function MyContents() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "contents"));
        const fetchedContents: Content[] = querySnapshot.docs
          .map(
            (docSnap) =>
              ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<Content, "id">),
              } as Content)
          )
          .sort(
            (a, b) =>
              (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );

        setContents(fetchedContents);
      } catch (error) {
        console.error("Error fetching contents: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "contents", id));
      setContents((prev) => prev.filter((content) => content.id !== id));
    } catch (error) {
      console.error("Error deleting content: ", error);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Contents</h1>
      {contents.length === 0 ? (
        <p>No content available</p>
      ) : (
        <ul className="space-y-4">
          {contents.map((content) => (
            <li
              key={content.id}
              className="border rounded-lg p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{content.title}</h2>
                <p className="text-sm text-gray-500">
                  {content.subject} • {content.language}
                </p>
                {content.videoUrl && (
                  <video
                    controls
                    className="mt-2 w-64 rounded-md"
                    src={content.videoUrl}
                  />
                )}
              </div>
              <Button
                // variant="destructive"
                onClick={() => handleDelete(content.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
