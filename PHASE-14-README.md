# Phase 14 — Global Admin Image Upload & Preview (Corrected)

Project: `seedlings-admin`

This phase actually wires the upload UX into the existing Admin image fields.

## Upload flow
1. Choose file(s)
2. Show local preview immediately
3. Preview is explicitly marked **not uploaded yet**
4. Admin clicks **Upload Image** / **Upload**
5. Existing Seedlings `lib/cloudinary.ts` uploads to Cloudinary
6. Returned `secure_url` is put into the form state
7. Existing Save/Create/Update action persists the URL in Firestore

## Integrated screens
- Products → Product Images (multiple images)
- Website CMS → Hero Slider → Hero image
- Website CMS → Homepage → existing image sections
- Website CMS → Our Journey → existing image sections
- Website CMS → Website Pages → existing page image + OG image
- Website CMS → Website Settings → Website logo

No ordinary URL field is converted into an image uploader. Button/link URLs remain text fields.

## Cloudinary
Uses the existing Seedlings implementation in `lib/cloudinary.ts` and the existing
unsigned upload preset. No second Cloudinary implementation is introduced.
