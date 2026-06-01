-- Replace deprecated payment_method values (bkash, nagad, card) with current options.

UPDATE public.expenses
SET payment_method = 'mobile_wallet'
WHERE payment_method IN ('bkash', 'nagad');

UPDATE public.expenses
SET payment_method = 'credit_card'
WHERE payment_method = 'card';

UPDATE public.recurring_items
SET payment_method = 'mobile_wallet'
WHERE payment_method IN ('bkash', 'nagad');

UPDATE public.recurring_items
SET payment_method = 'credit_card'
WHERE payment_method = 'card';
