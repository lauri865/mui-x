export const getThemedClassName = (className: string) => `twg-${className}`;

const className = {
  root: {
    base: 'group flex flex-1 box-border relative border border-solid border-grid-border bg-grid-bg text-grid-text font-normal text-sm leading-relaxed outline-none h-full min-w-0 min-h-0 flex-col overflow-hidden rounded-grid',
    autoHeight: 'h-auto',
    noScrollbar: 'scrollbar-none',
  },

  main: {
    base: 'group relative flex-1 flex flex-col overflow-hidden',
    scroller:
      'relative h-full flex-1 overflow-scroll [scrollbar-width:none] flex flex-col [&::-webkit-scrollbar]:hidden print:overflow-hidden z-0',
    skeleton:
      '[&_.twg-virtualScroller>.twg-filler]:!hidden [&_.twg-virtualScrollerContent]:invisible [&_.twg-virtualScrollerContent]:fixed',
  },

  panelAnchor: {
    base: 'absolute top-[var(--DataGrid-headersTotalHeight)] left-0 w-[calc(100%-(var(--DataGrid-hasScrollY)*var(--DataGrid-scrollbarSize)))]',
  },

  autosizing: {
    columnHeaderTitleContent: 'overflow-visible !important',
    cell: 'overflow-visible whitespace-nowrap min-w-max max-w-max',
    groupingCell: 'w-auto',
    treeDataGroupingCell: 'w-auto',
  },

  topContainer: 'sticky z-4 top-0',

  columnHeaders: {
    base: 'flex flex-col rounded-l-grid rounded-r-grid w-[var(--DataGrid-rowWidth)] bg-grid-header-bg select-none',
  },
  columnSeparator: {
    base: '',
  },
  columnHeader: {
    base: [
      'group/cell relative touch-none pl-cell pr-0.5 box-border tap-highlight-none flex items-center cursor-pointer border-b border-b-grid-border font-medium text-[1em] active:[&+&]:pointer-events-none data-sibling-focused:hover:z-0 justify-end',
      'data-[align=center]:justify-center data-[align=right]:flex-row-reverse data-[align=center]:pr-1.5 data-[align=right]:pr-cell data-[align=right]:pl-0.5',
      'hover:bg-grid-hover-bg transition-[background-color] active:bg-grid-hover-bg',
      'data-first:rounded-tl-[calc(var(--radius-grid)-1px)] group-data-fullwidth:data-last:rounded-tr-[calc(var(--radius-grid)-1px)]',
      'data-last:[&:not([data-pinned])]:overflow-hidden',
      '[&:hover_.twg-columnSeparator]:max-h-full',
      `data-[field=«check»]:p-0`,
      'group-data-dragging:[&_*]:pointer-events-none',
      // pinning borders
    ].join(' '),
    focusWithin: 'outline outline-[rgba(144,202,249,0.5)] -outline-offset-1',
    focus: 'outline outline-[#90caf9] -outline-offset-1',
    checkbox: '',
    header: 'relative flex items-center',
    headerFilter: 'pt-2 pb-2 pr-1.5 min-h-min overflow-hidden',
    sortedHeader: 'visible w-auto',
    headerTitle: 'flex items-center gap-0.5 min-w-0 flex-1 whitespace-nowrap overflow-hidden',
    headerTitleContent: 'overflow-hidden flex items-center',
    filledGroup: 'border-b border-solid',
    sortable: 'cursor-pointer',
    moving: 'bg-[rgba(255,255,255,0.08)]',
    pinned: 'sticky z-4 focus-within:z-5 data-sibling-focused:hover:z-6 bg-grid-pinned-bg',
    showLeftBorder: 'border-l border-l-grid-border',
    showRightBorder: 'border-r border-r-grid-border',

    draggableContainer: 'flex w-full h-full items-center',
    titleContainer:
      'flex h-full items-center min-w-0 flex-1 whitespace-nowrap overflow-hidden group-data-[align=center]/cell:justify-center group-data-[align=right]/cell:justify-end',
    titleContainerContent:
      'flex h-full items-center overflow-hidden pr-1 group-data-[align=right]/cell:pl-1',
    title: 'truncate',
  },

  cell: {
    base: [
      'group/cell h-[var(--height)] leading-[calc(var(--height)-1px)]',
      'flex-none box-border border-t border-grid-border px-cell truncate',
      'data-[align=center]:justify-center',
      'data-empty:flex-1 data-empty:p-0 ',
      `data-[field=«check»]:p-0 data-[field=«check»]:flex data-[field=«check»]:justify-center data-[field=«check»]:items-center`,
      'data-selected:bg-[rgba(144,202,249,0.16)] data-selected:hover:bg-[rgba(144,202,249,0.24)]',
      'data-reordering:bg-grid-hover-bg data-reordering:shadow-[inset_1px_0_0_0_var(--color-grid-border),inset_-1px_0_0_0_var(--color-grid-border),0px_0_1px_0px_#00000020]',
      // makes drag-drop easier, we can catch onPointerMove discretely at cell level, not cell content level
    ].join(' '),
    editable: '',
    editing: 'p-0.25 flex shadow-md bg-[#121212]',
    editingFocus: 'outline outline-[#90caf9] -outline-offset-1',
    boolean: 'flex h-full w-full items-center justify-center',
    booleanTrue: 'text-[rgba(255,255,255,0.7)]',
    booleanFalse: 'text-[rgba(255,255,255,0.5)]',
    actions: 'inline-flex items-center gap-2',
    showLeftBorder: 'border-l border-l-grid-border',
    showRightBorder: 'border-r border-r-grid-border',

    left: 'text-left justify-start',
    right: 'text-right justify-end',
    center: 'text-center justify-center',
    pinned: 'sticky z-[3] bg-grid-pinned-bg',
    isSelectionMode: 'cursor-default',
    flex: 'flex items-center',
    empty: 'twg-cell--empty opacity-30',
    group: 'pl-[calc(var(--spacing-cell)+var(--depth)*16px)]',
  },

  editCell: {
    base: '',
  },

  row: {
    base: [
      'flex group/row',
      'select-none',
      'w-[var(--DataGrid-rowWidth)]',
      'break-inside-avoid',
      // Hover states
      'hover:*:bg-grid-hover-bg',
      // Reset hover on touch devices
      'hover:*:bg-[unset]',
      // first visible
      'data-first-visible:[&>.twg-cell]:border-t-transparent',
      // last visible
      'data-bottom-border:border-b data-bottom-border:border-b-grid-border',
      // selected
      'data-selected:*:!bg-grid-selected-bg data-selected:*:hover:bg-grid-selected-bg data-selected:[--color-grid-border:var(--color-grid-selected-border)] data-selected:[&+.twg-row>.twg-cell]:border-t-[var(--color-grid-selected-border)]',
      'data-selectable:active:bg-grid-selected-bg',
      // editing
      'data-editing:bg-grid-editing-bg',
    ].join(' '),

    skeleton: 'hover:bg-transparent',

    editable: '',
    editing: 'bg-[#121212]',
    dynamicHeight: '[&>.twg-cell]:white-space-[initial] [&>.twg-cell]:leading-inherit',
  },

  pinnedRows: {
    base: 'sticky z-4 bg-grid-pinned-bg/50 shadow-sm shadow-black/30 backdrop-blur-sm w-[var(--DataGrid-rowWidth)]',
    top: 'top-0 [&_.twg-cell]:border-t-0 [&_.twg-cell]:border-b [&_.twg-cell]:!border-b-grid-border',
    bottom: 'bottom-0',
  },
  scrollbarFiller: {
    base: 'min-w-[calc(var(--DataGrid-hasScrollY)*var(--DataGrid-scrollbarSize))] self-stretch border-b border-b-grid-border',
  },

  filler: {
    base: 'flex-1',
    bottom: 'border-b border-b-grid-border',
  },

  footer: {
    base: 'select-none flex h-10 justify-between items-center border-t border-t-grid-border flex-shrink-0 px-cell text-[0.93em]',
  },
  rowCount: {
    base: 'flex items-center gap-1.5 text-grid-text/50',
    badge:
      'bg-grid-hover-bg px-1.5 py-0.5 rounded-md text-xs min-w-[20px] text-center border border-grid-border text-grid-text/40 tabular-nums font-normal',
  },
  selectedRowCount: {
    base: 'flex items-center gap-1.5 text-highlight-text cursor-pointer hover:bg-grid-hover-bg hover:opacity-50 pl-1.5 pr-1 -mr-1 py-1 rounded-grid transition-all',
    badge:
      'bg-highlight px-1.5 py-0.5 rounded-md text-xs min-w-[20px] text-center border border-highlight-border/50 text-highlight-text tabular-nums font-normal',
  },
  skeletonLoadingOverlay: {
    base: 'min-w-full w-max h-full overflow-clip',
  },

  detailPanel: {
    base: 'overflow-hidden',
    borderTop: 'border-t border-t-grid-border',
    borderBottom: 'border-b border-b-grid-border',
    content: 'h-max box-content overflow-auto',
    sticky: 'sticky left-0 w-[var(--DataGrid-innerWidth)]',
    static: 'relative',
  },
};

export const theme = className;
