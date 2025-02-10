const isRTL = typeof window !== 'undefined' && window.document.documentElement.dir === 'rtl';
export const useRtl = () => {
  return isRTL;
};
