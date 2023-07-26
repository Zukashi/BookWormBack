



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Zukashi/BookWormBack">
    <img src="https://cdn-icons-png.flaticon.com/512/2490/2490295.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">BookWorm</h3>

  <p align="center">
    This project aims to provide a user-friendly platform for managing book information, improving the efficiency of book management, and enhancing accessibility to    book information. The app can also facilitate community engagement and increase visibility for lesser-known books. Overall, the project seeks to create a comprehensive and engaging online resource for book lovers, promoting a love for reading and literature.
    <br/>
    <br/>
    <a href="https://book-worm-kjh8.onrender.com">Live</a>
    ·
    <a href="https://github.com/Zukashi/BookWormFront">Frontend Repository</a>
   
  </p>
  <p>Note: Please wait 30 seconds for site to load</p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#common-functionalities">Common Functionalities</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project


![alt screenshot of app](https://i.imgur.com/DXTDK2r.jpeg)

![alt screenshot of app](https://i.imgur.com/L6bhs01.jpeg)

![alt screenshot of app](https://i.imgur.com/RFEPVWs.png)

![alt screenshot of app](https://i.imgur.com/2ZYU4hy.png)

![alt screenshot of app](https://i.imgur.com/eNTJT46.png)

![alt screenshot of app](https://i.imgur.com/jhcsJcm.png)

![alt screenshot of app](https://i.imgur.com/PMviI6a.png)

![alt screenshot of app](https://i.imgur.com/YNeeEJM.png)

![alt screenshot of app](https://i.imgur.com/7ZeftOs.jpeg)

![alt screenshot of app](https://i.imgur.com/odflOyV.jpeg)
#### Common functionalities
* Responsive
* Mobile first
* JWT Auth
* This project consumes OpenLibrary API
* User/Admin Must be logged in to use site 
* Admin can view all users
* Admin can edit user's details
* Admin can delete user
* Admin can delete book
* Admin can edit book
* Admin can view all books
* User can change his details along with password
* User can reset his password 
* User can search for books 
* User can add books
* User can add books to his his want to read / reading / read list
* User can change progress of reading of his book while it's in reading list
* User can rate books 
* User can add review for book
* User can add book to favorites
* User can comment reviews
* User can show reviews based on selected rating
* User can sort books by avg rating book name or author (user lists only)
* User can change amount of entities he views in his lists
* User can see other people's favorites and want to read / reading / read lists.



<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Built With
 [![Javascript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.ecmascript.org/)
 [![Typescript](https://img.shields.io/badge/typescript-1DA1F2?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
 [![React][React.js]][React-url]
 [![NodeJs](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
 [![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
 [![MongoDb](https://img.shields.io/badge/MongoDB-409C52?style=for-the-badge&logo=mongodb&logoColor=green)](https://mongodb.com/)
 [![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
 [![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux.js.org/)
 [![ReactRouter](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started




### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Zukashi/BookWormBack.git
   ```
2. Change directory
    ```sh
    cd BookWormBack
    ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Create .env file inside BookWormBack directory. MONGODB_URL is mongodb URI for connecting to db through     <a href="https://www.mongodb.com/atlas/database" target="_blank">cloud</a> or locally it's up to you
   ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET in those two you should input random strings
    ```sh
    MONGODB_URL=
    ACCESS_TOKEN_SECRET=
    REFRESH_TOKEN_SECRET=
    ```
5. Run the script
   ```sh
   npm run start-dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>






<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoC
