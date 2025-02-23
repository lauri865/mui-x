'use client';

import { cn } from '@/lib/cn';
import { DownloadIcon, LoaderIcon } from 'lucide-react';
import * as React from 'react';
import { Tooltip } from '../ui/tooltip';
import { useDemoContext } from './DemoContext';

// Dynamically import fflate (only loaded when needed)
const fflatePromise = import('fflate');

export function DownloadButton(props: { className?: string }) {
  const context = useDemoContext();
  const [loading, setLoading] = React.useState(false);

  const modifyAndDownloadZip = async () => {
    setLoading(true);

    try {
      // Lazy load fflate
      const { unzip, zip, strFromU8, strToU8 } = await fflatePromise;

      const activeTab = context.activeTabRef.current;
      // Fetch the base ZIP file
      const response = await fetch(`/demo-${activeTab}.zip`);
      if (!response.ok) throw new Error('Failed to download template.zip');
      const arrayBuffer = await response.arrayBuffer();

      // Unzip the file
      unzip(new Uint8Array(arrayBuffer), (err, files) => {
        if (err) {
          console.error('Error unzipping file:', err);
          setLoading(false);
          return;
        }

        // Modify a specific file inside the ZIP (e.g., "example.txt")
        files[`src/Demo.${activeTab}`] = strToU8(context.code[activeTab]);
        files['package.json'] = strToU8(
          strFromU8(files['package.json'])
            .replace('{{name}}', `TWGrid – ${context.code.fileName.replace(/\.tsx$/, '')}`)
            .replace(
              '{{description}}',
              `https://github.com/twgrid/react/blob/main/examples/${context.code.fileName}`,
            ),
        );
        // Rezip the modified files
        zip(files, (err, newZip) => {
          if (err) {
            console.error('Error zipping file:', err);
            setLoading(false);
            return;
          }

          // Create a Blob and trigger download
          const blob = new Blob([newZip], { type: 'application/zip' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${context.code.fileName.replace(/\.tsx$/, '')}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setLoading(false);
        });
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Download a demo package">
      <button onClick={modifyAndDownloadZip} disabled={loading} className={cn(props.className)}>
        {loading ? <LoaderIcon className="animate-spin repeat-infinite" /> : <DownloadIcon />}
      </button>
    </Tooltip>
  );
}
