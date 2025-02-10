import * as React from 'react';
import { copyToClipboard } from '../../hooks/features/clipboard/useGridClipboard';
import { GridPinnedRowPosition } from '../../hooks/features/rowPinning';
import { useGridApiEventHandler } from '../../hooks/utils/useGridApiEventHandler';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridCellParams } from '../../models/params/gridCellParams';

export const GridContextMenu = () => {
  const contextMenuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();
  const ContextMenu = rootProps.slots.baseContextMenu;
  const hasCustomContextMenu = ContextMenu != null;

  const [cell, setCell] = React.useState<GridCellParams<any> | null>(null);
  const cellElementRef = React.useRef<HTMLElement | null>(null);

  useGridApiEventHandler(apiRef, 'cellContextMenu', (params, event) => {
    if (event.ctrlKey) {
      return;
    }
    if (!hasCustomContextMenu) {
      return;
    }

    setCell(params);
    event.preventDefault();

    cellElementRef.current = event.currentTarget;
    cellElementRef.current.dataset.open = 'true';

    triggerRef.current?.dispatchEvent(new MouseEvent('contextmenu', { ...(event as any) }));
  });

  if (!hasCustomContextMenu) {
    return null;
  }

  const selection = apiRef.current.getSelectedRows();

  return (
    <ContextMenu.Root
      onOpenChange={(open) => {
        if (!open) {
          setCell(null);
          if (cellElementRef.current) {
            cellElementRef.current.removeAttribute('data-open');
            const el = cellElementRef.current;
            requestAnimationFrame(() => {
              el?.focus();
            });
            cellElementRef.current = null;
          }
        }
      }}
      modal
    >
      <ContextMenu.Trigger asChild>
        <span ref={triggerRef} />
      </ContextMenu.Trigger>
      {cell && (
        <ContextMenu.Portal>
          <ContextMenu.Content
            ref={contextMenuRef}
            onInteractOutside={(e) => {
              if (
                e.detail.originalEvent instanceof PointerEvent &&
                e.detail.originalEvent.button === 0
              ) {
                document.body.style.pointerEvents = '';
                const elementAtPoint = document.elementFromPoint(
                  e.detail.originalEvent.clientX,
                  e.detail.originalEvent.clientY,
                );
                const cell = elementAtPoint?.closest('div[role="gridcell"]') as HTMLElement;
                if (cell) {
                  cellElementRef.current?.removeAttribute('data-open');
                  cellElementRef.current = cell;
                }
              }
            }}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {cell.colDef.editable && (
              <>
                <ContextMenu.Item
                  onSelect={() => {
                    requestAnimationFrame(() => {
                      if (rootProps.editMode === 'cell') {
                        apiRef.current.startCellEditMode({
                          id: cell.id,
                          field: cell.field,
                        });
                      } else {
                        apiRef.current.startRowEditMode({
                          id: cell.id,
                        });
                      }
                    });
                  }}
                >
                  Edit {rootProps.editMode === 'cell' ? 'Cell' : 'Row'}
                  <ContextMenu.Shortcut>↵</ContextMenu.Shortcut>
                </ContextMenu.Item>
                <ContextMenu.Separator />
              </>
            )}
            {cell.colDef.editable && (
              <ContextMenu.Item>
                Cut<ContextMenu.Shortcut>⌘+V</ContextMenu.Shortcut>
              </ContextMenu.Item>
            )}
            <ContextMenu.Item
              onSelect={() => {
                apiRef.current.setCellFocus(cell.id, cell.field);
                cellElementRef.current?.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    key: 'c',
                    keyCode: 67,
                    ctrlKey: true,
                    metaKey: true,
                    bubbles: true,
                  }),
                );
              }}
            >
              Copy
              <ContextMenu.Shortcut>⌘+C</ContextMenu.Shortcut>
            </ContextMenu.Item>
            <ContextMenu.Item
              onSelect={() => {
                const selection = apiRef.current.getSelectedRows();
                let textToCopy = '';
                if (selection.size === 0) {
                  textToCopy = apiRef.current.getDataAsCsv({
                    includeHeaders: true,
                    delimiter: rootProps.clipboardCopyCellDelimiter,
                    shouldAppendQuotes: false,
                    escapeFormulas: false,
                    fields: [cell.field],
                    getRowsToExport: () => [cell.id],
                  });
                } else {
                  textToCopy = apiRef.current.getDataAsCsv({
                    includeHeaders: true,
                    delimiter: rootProps.clipboardCopyCellDelimiter,
                    shouldAppendQuotes: false,
                    escapeFormulas: false,
                  });
                }
                textToCopy = apiRef.current.unstable_applyPipeProcessors(
                  'clipboardCopy',
                  textToCopy,
                );

                if (textToCopy) {
                  copyToClipboard(textToCopy);
                  apiRef.current.publishEvent('clipboardCopy', textToCopy);
                }
              }}
            >
              Copy with headers
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger>
                <rootProps.slots.pinIcon />
                Pin Row
              </ContextMenu.SubTrigger>
              <ContextMenu.SubContent>
                <ContextMenu.RadioGroup
                  value={apiRef.current.getRowPinnedPosition(cell.id) || ''}
                  onValueChange={(value) => {
                    if (value === '') {
                      apiRef.current.unpinRow(cell.id);
                    } else {
                      apiRef.current.pinRow(cell.id, value as GridPinnedRowPosition);
                    }
                  }}
                >
                  <ContextMenu.RadioItem value={GridPinnedRowPosition.top}>
                    Top
                  </ContextMenu.RadioItem>
                  <ContextMenu.RadioItem value={GridPinnedRowPosition.bottom}>
                    Bottom
                  </ContextMenu.RadioItem>
                  {apiRef.current.isRowPinned(cell.id) && (
                    <ContextMenu.RadioItem value="">Unpin</ContextMenu.RadioItem>
                  )}
                </ContextMenu.RadioGroup>
              </ContextMenu.SubContent>
            </ContextMenu.Sub>
            <ContextMenu.Separator />
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger>
                <span>
                  Export
                  {selection.size ? (
                    <span className="opacity-70">&nbsp;({selection.size})</span>
                  ) : (
                    ''
                  )}
                </span>
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent alignOffset={-4}>
                  <ContextMenu.Item
                    onSelect={() => {
                      apiRef.current.exportDataAsCsv({
                        fileName: 'export',
                      });
                    }}
                  >
                    CSV
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    onSelect={() => {
                      apiRef.current.exportDataAsPrint();
                    }}
                  >
                    Print
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      )}
    </ContextMenu.Root>
  );
};
