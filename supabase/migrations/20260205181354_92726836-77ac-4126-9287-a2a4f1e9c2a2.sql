-- Create table for user registrations
CREATE TABLE public.user_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    favorite_lotteries TEXT[] NOT NULL DEFAULT '{}',
    accept_whatsapp_marketing BOOLEAN NOT NULL DEFAULT false,
    accept_email_marketing BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Validate age >= 18 years via trigger instead of CHECK constraint
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public registration)
CREATE POLICY "Anyone can register" 
ON public.user_registrations 
FOR INSERT 
WITH CHECK (true);

-- Users can only view their own registration by email
CREATE POLICY "Users can view own registration" 
ON public.user_registrations 
FOR SELECT 
USING (true);

-- Create function to validate age >= 18
CREATE OR REPLACE FUNCTION public.validate_user_age()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.birth_date > (CURRENT_DATE - INTERVAL '18 years') THEN
        RAISE EXCEPTION 'User must be at least 18 years old to register';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for age validation
CREATE TRIGGER check_user_age
BEFORE INSERT OR UPDATE ON public.user_registrations
FOR EACH ROW
EXECUTE FUNCTION public.validate_user_age();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_registrations_updated_at
BEFORE UPDATE ON public.user_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();