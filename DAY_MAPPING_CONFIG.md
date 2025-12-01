# Day Mapping Configuration Guide

## Current Configuration (Testing)

The system is currently configured to map calendar dates to conference days as follows:
- **Date 9** = Day 1
- **Date 10** = Day 2
- **Date 11** = Day 3

This means:
- If today is the 9th of the month, the halls will show Day 1 schedules
- If today is the 10th of the month, the halls will show Day 2 schedules
- If today is the 11th of the month, the halls will show Day 3 schedules

## How It Works

The halls status API (`/api/halls/status`) now filters schedules to only show sessions for the current conference day based on the date mapping. This ensures that:
- Only relevant sessions for today are displayed
- Current and next sessions are filtered by the day's date range
- Sessions from other days are hidden

## Updating for Production

To update the day mapping for your actual conference dates, follow these steps:

### Step 1: Update the Date Mapping

Edit the file: `iisc/lib/server/utils/dateMapping.ts`

Update the `DATE_TO_DAY_MAP` object with your actual conference dates:

```typescript
export const DATE_TO_DAY_MAP: Record<number, number> = {
  1: 1,   // 15th = Day 1 (change to your actual date)
  2: 2,   // 16th = Day 2 (change to your actual date)
  3: 3,   // 17th = Day 3 (change to your actual date)
  // Add more days as needed
};
```

### Step 2: Update the Start Date (if needed)

If you need to change the base date reference, update:

```typescript
export const START_DATE = 15; // Change to your actual start date
```

### Step 3: Restart the Server

After making changes, restart your Next.js server for the changes to take effect:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
# or
npm start
```

## Example: Updating for a Conference on January 20-22

1. Open `iisc/lib/server/utils/dateMapping.ts`
2. Change the mapping to:
   ```typescript
   export const DATE_TO_DAY_MAP: Record<number, number> = {
     20: 1,   // January 20 = Day 1
     21: 2,   // January 21 = Day 2
     22: 3,   // January 22 = Day 3
   };
   ```
3. Update `START_DATE` if needed (though it's mainly for reference)
4. Restart the server

## Testing

To test different days:
1. Temporarily change the date mapping in `dateMapping.ts`
2. Restart the server
3. Check the halls page to see if it shows the correct day's sessions
4. Remember to change it back to your actual dates before production!

## Notes

- The system automatically determines the current day based on the date of the month
- Only schedules within the current day's date range are shown
- If today is not a conference day (not in the mapping), no day-specific filtering is applied
- The mapping is month-agnostic - it uses the day of the month (1-31), not the full date

