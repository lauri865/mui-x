import * as React from 'react';
import { GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD } from '../../colDef';
import { gridFilterModelSelector } from '../../hooks';
import { copyToClipboard } from '../../hooks/features/clipboard/useGridClipboard';
import { GridPinnedRowPosition } from '../../hooks/features/rowPinning';
import { useGridApiEventHandler } from '../../hooks/utils/useGridApiEventHandler';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridGroupNode, GridLogicOperator } from '../../models';
import { GridCellParams } from '../../models/params/gridCellParams';

export function GridContextMenu() {
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

  useGridApiEventHandler(apiRef, 'cellKeyDown', (params, event) => {
    if (event.key === 'x' && (event.ctrlKey || event.metaKey)) {
      const bbox = (event.currentTarget as HTMLElement).getBoundingClientRect();
      event.currentTarget.dispatchEvent(
        new MouseEvent('contextmenu', {
          ...(event as any),
          clientX: bbox.left - 2,
          clientY: bbox.bottom + 4,
        }),
      );
    }
  });

  if (!hasCustomContextMenu) {
    return null;
  }

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
            <ItemEdit cell={cell} apiRef={apiRef} />
            <ItemClipboard cell={cell} apiRef={apiRef} />
            <ContextMenu.Separator />
            <ItemRowGrouping cell={cell} apiRef={apiRef} />
            <ItemDetailPanel cell={cell} apiRef={apiRef} />
            <ItemPinRow cell={cell} apiRef={apiRef} />
            <ContextMenu.Separator />
            <ItemExcludeRow cell={cell} apiRef={apiRef} />
            <ItemExport cell={cell} apiRef={apiRef} />
          </ContextMenu.Content>
        </ContextMenu.Portal>
      )}
    </ContextMenu.Root>
  );
}

type ItemProps = {
  apiRef: React.RefObject<any>;
  cell: GridCellParams<any>;
};

const ItemEdit = ({ apiRef, cell }: ItemProps) => {
  const rootProps = useGridRootProps();
  const ContextMenu = rootProps.slots.baseContextMenu!;

  if (!cell.colDef.editable) {
    return null;
  }

  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};

const ItemClipboard = ({ apiRef, cell }: ItemProps) => {
  const rootProps = useGridRootProps();
  const ContextMenu = rootProps.slots.baseContextMenu!;
  const selection = apiRef.current.getSelectedRows();
  return (
    <>
      {cell.colDef.editable && (
        <ContextMenu.Item>
          Cut<ContextMenu.Shortcut>⌘+V</ContextMenu.Shortcut>
        </ContextMenu.Item>
      )}
      <ContextMenu.Item
        onSelect={() => {
          apiRef.current.setCellFocus(cell.id, cell.field);
          const cellEl = apiRef.current.getCellElement(cell.id, cell.field);
          cellEl.current?.dispatchEvent(
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
        Copy{selection.size ? ` (${selection.size})` : ''}
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
          textToCopy = apiRef.current.unstable_applyPipeProcessors('clipboardCopy', textToCopy);

          if (textToCopy) {
            copyToClipboard(textToCopy);
            apiRef.current.publishEvent('clipboardCopy', textToCopy);
          }
        }}
      >
        Copy with headers{selection.size ? ` (${selection.size})` : ''}
      </ContextMenu.Item>
    </>
  );
};

const ItemRowGrouping = ({ apiRef, cell }: ItemProps) => {
  const ContextMenu = useGridRootProps().slots.baseContextMenu!;

  if (cell.rowNode.type !== 'group') {
    return null;
  }

  return (
    <ContextMenu.Item
      onSelect={() =>
        apiRef.current.setRowChildrenExpansion(
          cell.id,
          !(cell.rowNode as GridGroupNode).childrenExpanded,
        )
      }
    >
      {apiRef.current.getLocaleText(
        cell.rowNode.childrenExpanded ? 'groupCollapse' : 'groupExpand',
      )}
      <ContextMenu.Shortcut>⌘E</ContextMenu.Shortcut>
    </ContextMenu.Item>
  );
};

const ItemDetailPanel = ({ apiRef, cell }: ItemProps) => {
  const rootProps = useGridRootProps();
  const ContextMenu = rootProps.slots.baseContextMenu!;

  const hasDetailPanel = rootProps.getDetailPanelContent?.(apiRef.current.getRowParams(cell.id));
  if (!hasDetailPanel) {
    return null;
  }

  return (
    <ContextMenu.Item onSelect={() => apiRef.current.toggleDetailPanel(cell.id)}>
      {apiRef.current.getLocaleText(
        apiRef.current.isDetailPanelExpanded(cell.id) ? 'collapseDetailPanel' : 'expandDetailPanel',
      )}
      <ContextMenu.Shortcut>⌘D</ContextMenu.Shortcut>
    </ContextMenu.Item>
  );
};

const ItemPinRow = ({ apiRef, cell }: ItemProps) => {
  const rootProps = useGridRootProps();
  const ContextMenu = rootProps.slots.baseContextMenu!;
  if (cell.rowNode.type === 'group') {
    return null;
  }

  return (
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
          {apiRef.current.isRowPinned(cell.id) && (
            <ContextMenu.RadioItem value="">Unpin</ContextMenu.RadioItem>
          )}
          <ContextMenu.RadioItem value={GridPinnedRowPosition.top}>Top</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value={GridPinnedRowPosition.bottom}>Bottom</ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
  );
};

const ItemExport = ({ apiRef, cell }: ItemProps) => {
  const ContextMenu = useGridRootProps().slots.baseContextMenu!;
  const selection = apiRef.current.getSelectedRows();
  return (
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger>
        <span>
          Export
          {selection.size ? <span className="opacity-70">&nbsp;({selection.size})</span> : ''}
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
  );
};
const ItemExcludeRow = ({ apiRef, cell }: ItemProps) => {
  const ContextMenu = useGridRootProps().slots.baseContextMenu!;

  if (cell.rowNode.type === 'footer') {
    return null;
  }

  if (cell.rowNode.type === 'group' && !cell.rowNode.groupingField) {
    return null;
  }

  return (
    <ContextMenu.Item
      onSelect={() => {
        const randomId = Math.floor(Math.random() * 1000);

        if (cell.rowNode.type === 'group') {
          apiRef.current.setFilterModel({
            items: [
              ...gridFilterModelSelector(apiRef.current.state).items,
              {
                field: GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
                id: randomId,
                logicOperator: GridLogicOperator.And,
                conditions: [
                  {
                    operator: 'doesNotEqual',
                    value: cell.rowNode.groupingKey,
                  },
                ],
              },
            ],
          });
          return;
        }

        const operator =
          cell.colDef.filterOperators?.find(
            (op) => op.value === '!=' || op.value === 'doesNotEqual',
          )?.value || '!=';
        const rowId = apiRef.current.getRowId(cell.row);
        apiRef.current.setFilterModel({
          items: [
            ...gridFilterModelSelector(apiRef.current.state).items,
            {
              field: 'id',
              id: randomId,
              logicOperator: GridLogicOperator.And,
              conditions: [
                {
                  operator: operator,
                  value: operator === '!=' ? rowId : String(rowId),
                },
              ],
            },
          ],
        });
      }}
    >
      Exclude {cell.rowNode.type === 'group' ? 'Group' : 'Row'}
    </ContextMenu.Item>
  );
};
