# CV assets

`PROFILE.cvUrl` (`packages/shared/src/constants/profile.ts`) points to
`/cv/Julio_Nieto_CV.pdf`, which is served from this directory.

**Owner action required (pending input):** place the real CV file here as
`Julio_Nieto_CV.pdf`. No placeholder PDF is committed on purpose — a fake file
would be served with a 200 and silently break the "download CV" link.

The URL is already wired end-to-end; only the binary is missing.
