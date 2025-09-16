import React, { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Upload } from 'lucide-react';

const useCsvChunkedImport = ({ onImportFinished }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ total: 0, imported: 0, errors: 0 });

  const handleBulkImport = (file, importFunction, entityName) => {
    if (!file) {
      toast.error('Please select a CSV file to import');
      return;
    }

    setIsImporting(true);
    setImportProgress({ total: 0, imported: 0, errors: 0 });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const records = results.data;
        setImportProgress(prev => ({ ...prev, total: records.length }));

        const chunkSize = 10;
        let successfulImports = 0;
        let errorImports = 0;

        for (let i = 0; i < records.length; i += chunkSize) {
          const chunk = records.slice(i, i + chunkSize);
          try {
            await importFunction({ [entityName]: chunk });
            successfulImports += chunk.length;
            setImportProgress(prev => ({ ...prev, imported: prev.imported + chunk.length }));
          } catch (error) {
            console.error("Failed to import chunk:", error);
            errorImports += chunk.length;
            setImportProgress(prev => ({ ...prev, errors: prev.errors + chunk.length }));
          }
        }

        toast.success('Import process finished!', {
          description: `${successfulImports} records imported, ${errorImports} failed.`,
        });

        if (onImportFinished) {
          onImportFinished();
        }
        setIsImporting(false);
      },
      error: (error) => {
        toast.error('Failed to parse CSV file.');
        console.error("CSV parsing error:", error);
        setIsImporting(false);
      }
    });
  };

  return { isImporting, importProgress, handleBulkImport };
};

const CsvChunkedImportForm = ({ apiImportFunction, entityName, onFinished, sampleCsvUrl }) => {
  const [csvFile, setCsvFile] = useState(null);
  const { isImporting, importProgress, handleBulkImport } = useCsvChunkedImport({
    onImportFinished: onFinished,
  });

  const onFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const onImportClick = () => {
    handleBulkImport(csvFile, apiImportFunction, entityName);
  };

  return (
    <>
      <Dialog open={isImporting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importing Records</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p>
              {`Processing... ${importProgress.imported} / ${importProgress.total}`}
            </p>
            {importProgress.errors > 0 && (
              <p className="text-red-500">{`${importProgress.errors} records in failed chunks.`}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Input type="file" accept=".csv" onChange={onFileChange} className="flex-grow" />
          <Button onClick={onImportClick} disabled={!csvFile || isImporting}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
        {sampleCsvUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={sampleCsvUrl} download>
              Download Sample
            </a>
          </Button>
        )}
      </div>
    </>
  );
};

export default CsvChunkedImportForm;
