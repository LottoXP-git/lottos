-- Fix function search_path for validate_user_age
CREATE OR REPLACE FUNCTION public.validate_user_age()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.birth_date > (CURRENT_DATE - INTERVAL '18 years') THEN
        RAISE EXCEPTION 'User must be at least 18 years old to register';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;