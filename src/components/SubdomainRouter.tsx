import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';

export const SubdomainRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
};