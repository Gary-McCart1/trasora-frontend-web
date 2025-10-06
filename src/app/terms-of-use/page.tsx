import { Suspense } from 'react'; // 1. Import Suspense
import TermsOfUseClient from './TermsOfUseClient';

export const dynamic = 'force-dynamic';

export default function TermsOfUsePage() {
  return (
    
    <Suspense fallback={<div>Loading...</div>}> 
      <TermsOfUseClient />
    </Suspense>
  );
}