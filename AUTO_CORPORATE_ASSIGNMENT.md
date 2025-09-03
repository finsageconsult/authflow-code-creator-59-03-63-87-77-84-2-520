# Automatic Corporate Assignment Feature

## Overview
When clients sign up with a company name, the system automatically checks if a corporate account with that name exists and assigns the client to it as a "preferred corporate" if found.

## How It Works

### 1. Client Registration Process
- When a client fills out the registration form and provides a company name
- The system searches for an existing corporate account with a matching name (case-insensitive)
- If a match is found and the corporate is active, the client is automatically assigned to that corporate
- The `corporate_id` field in `client_registrations` table is populated with the matching corporate's ID

### 2. Visual Feedback
- **For Clients**: Success messages indicate if they were automatically assigned to their company
- **For Admins**: 
  - Green badge shows "Auto-assigned to [Company Name]" in pending registrations
  - Statistics card shows total count of auto-assigned registrations
  - Clear visual indicators help admins identify which registrations have been pre-assigned

### 3. Implementation Details

#### Updated Components:
- `src/hooks/useClientAuth.tsx` - Modified `signUp` function to include corporate matching logic
- `src/pages/ClientAuth.tsx` - Updated both registration forms to include company field and corporate assignment
- `src/components/client-management/PendingRegistrations.tsx` - Added visual indicators for auto-assigned clients
- `src/components/ClientRegistrationRequests.tsx` - Added statistics for auto-assignments

#### Database Changes:
- Uses existing `corporate_id` field in `client_registrations` table
- Queries `corporates` table for name matching (case-insensitive using `ilike`)
- Only matches with active corporate accounts (`status = 'active'`)

#### Matching Logic:
```sql
-- Searches for corporate with matching name
SELECT id, name FROM corporates 
WHERE name ILIKE 'Company Name' 
AND status = 'active'
```

### 4. Benefits
- **Streamlined Onboarding**: Clients from existing corporate partners are automatically pre-assigned
- **Reduced Admin Work**: Less manual assignment needed for corporate employees
- **Better User Experience**: Clients see immediate confirmation of corporate association
- **Data Integrity**: Ensures consistent corporate-client relationships from signup

### 5. Future Enhancements
- Email domain matching (e.g., @company.com matches Company Inc.)
- Multiple corporate matching strategies
- Bulk import of employee lists with automatic assignment
- Corporate admin approval workflow for new employee registrations

## Usage
Simply include a company name when registering as a client. If the company exists in the corporate accounts, you'll be automatically assigned and see a confirmation message.