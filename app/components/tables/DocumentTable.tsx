"use client";

import { useConfirmationDialogue } from "@/app/providers/child-providers/ConfirmationDialogProvider";
import { Button } from "@headlessui/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react"
import SyncButton from "../buttons/SyncButton";
import Loader from "../Loader";

export default function DocumentTable() {
  const confirmationDialogue = useConfirmationDialogue();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getUploadedFiles();
  }, []);

  async function getUploadedFiles() {
    setIsLoading(true);

    const res = await fetch("/api/files")
    const body = await res.json();

    console.log(body.files);
    setUploadedFiles(body.files);

    setIsLoading(false);
  }

  async function deleteFile(uri: string) {
    const res = await fetch(`/api/files?uri=${uri}`, {
      method: "DELETE",
    })
    const body = await res.json();
    console.log(body);

    getUploadedFiles();
  }

  function openDeleteFlow(fileName: string, uri: string) {
    confirmationDialogue.setTitle(`Delete ${fileName}?`)
    confirmationDialogue.setMessage("Deleting this file is an action which cannot be reversed. Would you like to proceed?")
    confirmationDialogue.setCallback(() => () => deleteFile(uri));
    confirmationDialogue.openPopup();
  }

  return (
    <div className="px-4">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex flex-row">
            <h1 className="text-base font-semibold dark:text-white mt-4">Documents</h1>
            <SyncButton onPressed={getUploadedFiles} />
          </div>
          <p className="mt-2 text-sm dark:text-gray-300 text-gray-600">
            A list of all uploaded evidence documents
          </p>
        </div>
      </div>

      <div className="ml-auto w-fit">

      </div>

      <div className="-mx-4 mt-8 sm:-mx-0">
        <table className="min-w-full divide-y divide-white/15">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold dark:text-white text-black">
                Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold dark:text-white text-black">
                Status
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-4 sm:pr-0">
                <span className="sr-only">Delete</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:bg-gray-900">
            {!isLoading ? uploadedFiles.map((file) => (
              <tr key={file.uri}>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium dark:text-white text-gray-600 sm:w-auto sm:max-w-none">
                  {file.fileName}
                  <dl className="font-normal lg:hidden">
                  </dl>
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-400">{file.status}</td>
                <td className="py-4 pl-3 pr-8 text-right text-sm font-medium">
                  <a onClick={() => openDeleteFlow(file.fileName, file.uri)} className="text-indigo-400 hover:text-indigo-300">
                    Delete<span className="sr-only">, {file.fileName}</span>
                  </a>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3}>
                  <Loader />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
