# 🏥 SysClinica - Frontend

Professional clinical management system focused on security, high performance, and user experience (UX).

## 🚀 Tech Stack

* **Angular 19**: Modern implementation utilizing Signals, native Control Flow, and Standalone Components.
* **Tailwind CSS**: Utility-first CSS framework for responsive and customized design.
* **PrimeNG**: Premium UI component library with the Aura theme.
* **RxJS**: Asynchronous data stream management and reactivity.
* **TypeScript**: Robust development with static typing.

## 🛡️ Architecture and Security

This project was built following **SOLID** principles and the best security practices for enterprise applications:

* **JWT Authentication**: Token management via authorization headers.
* **Silent Refresh Token**: Automatic renewal flow using `HttpOnly Cookies` in the backend to prevent XSS attacks.
* **RBAC (Role-Based Access Control)**: Access control based on user profiles (`ROLE_ADMIN`, `ROLE_CADASTROS`, `ROLE_ATENDIMENTO`, etc).
* **Functional Interceptors**: Centralized HTTP request handling and automatic token renewal upon 401 errors.
* **Route Guards**: Protection against direct access to sensitive URLs based on the user's role.
* **Global Messaging System**: Custom modal component (success, error, warning, info, and question) managed by Signals.

## 📦 Project Structure

* `src/app/core`: Global services, interceptors, guards, and data models.
* `src/app/shared`: Reusable components (modals, buttons, etc).
* `src/app/features`: Business functionality modules (Auth, Dashboard, Registrations).

## 🛠️ Installation and Execution

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    ng serve
    ```

4.  Access the application at: `http://localhost:4200`

---
*Developed with technical excellence by AJA-Software.*