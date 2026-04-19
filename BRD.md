# BRD: CinePro Marketplace

## 1. Project Overview
CinePro Marketplace is a comprehensive platform for the film production industry, connecting service providers (locations, equipment, models, crew) with clients (directors, producers, production houses).

## 2. User Roles
- **Clients**: Rent locations/equipment, book talent/crew.
- **Freelancers (Models/Crew)**: List services, manage availability.
- **Companies (Equipment/Locations)**: List assets, manage rentals.
- **Employees**: Facilitate location visits, prevent side-deals, ensure smooth operations.
- **Admins**: Review listings (locations), moderate content, manage users.

## 3. Core Functional Requirements

### 3.1 Locations
- **Listing**: Owners can submit locations with photos and details.
- **Approval**: Admin must review and accept locations before they go live.
- **Facilitation**: When a client wants to see a location, an Employee accompanies them to prevent direct deals outside the platform.
- **Reviews**: Clients can comment and rate locations.

### 3.2 Equipment
- **Listing**: Detailed descriptions, pricing, photos, and current status (Available/Rented/Maintenance).
- **Booking**: Calendar selection for rental dates.
- **Evidence Tracking**: Photos/descriptions of equipment status uploaded at rental start/end to track damage.
- **Contractual Evidence**: Systematic tracking to hold clients accountable for broken gear.

### 3.3 Models & Casting
- **Profiles**: Detailed attributes (Experience, Gender, Age, Skin Tone, Height, Weight, Location).
- **Filtering**: Advanced search based on all profile attributes.
- **No-Show Policy**: Strict policy for models (and crew) who fail to attend a shoot after payment.

### 3.4 Crew (Photographers/Videographers)
- **Roles**: DP, 1st AC, 2nd AC, Photographer, etc.
- **Profiles**: Portfolio and experience details.
- **Availability**: Integrated calendar showing booked vs. available time.

## 4. Technical Features
- **Availability Sync**: Users can add external dates (off-platform bookings) to correctly reflect availability.
- **Privacy Maps**: Location maps are only visible to Employees/facilitators, not to public users before booking.
- **Payment & Booking**: Real-time calendar booking and payment processing (conceptual).

## 5. Security & Policies
- **No-Theft Policy**: Employee-guided visits to ensure platform commission is protected.
- **Evidence System**: Mandatory status photos for equipment.
- **No-Show Penalties**: Applied across all talent and crew roles.
