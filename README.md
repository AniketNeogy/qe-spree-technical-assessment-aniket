# Spree eCommerce Technical Assessment

This is a technical assessment for Quality Engineering using Spree Commerce platform.

## About Spree Commerce

This project uses [Spree Commerce](https://spreecommerce.org) - the open-source e-commerce platform for Rails. It is a great starting point for any Rails developer to quickly build an e-commerce application.

This starter uses:

* Spree Commerce 5 which includes Admin Dashboard, API and Storefront
* Ruby 3.3 and Ruby on Rails 7.2
* [Devise](https://github.com/heartcombo/devise) for authentication
* [Solid Queue](https://github.com/rails/solid_queue) with Mission Control UI (access only to Spree admins) for background jobs
* [Solid Cache](https://github.com/rails/solid_cache) for excellent caching and performance
* PostgreSQL as a database

## Local Installation

Please follow [Spree Quickstart guide](https://spreecommerce.org/docs/developer/getting-started/quickstart) to setup your Spree application using the Spree starter.

## Local Installation (Windows)

Follow these steps to set up the development environment on Windows:

1. **Setup Windows Subsystem for Linux (WSL)**
   - Enable WSL through Windows features
   - Install Ubuntu (or another Linux distribution) from the Microsoft Store
   - Set up WSL by running it and following the initial setup prompts

2. **Install Required Dependencies**
   - Open a WSL terminal and run:
     ```bash
     sudo apt-get update
     sudo apt-get install -y libvips-dev libpq-dev
     ```

3. **Install Ruby using rbenv**
   - Install the necessary dependencies:
     ```bash
     sudo apt-get install -y build-essential libssl-dev libreadline-dev zlib1g-dev
     ```
   - Install rbenv:
     ```bash
     curl -fsSL https://github.com/rbenv/rbenv-installer/raw/main/bin/rbenv-installer | bash
     ```
   - Add rbenv to your shell:
     ```bash
     echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
     echo 'eval "$(rbenv init -)"' >> ~/.bashrc
     source ~/.bashrc
     ```
   - Install Ruby 3.3.0:
     ```bash
     rbenv install 3.3.0
     rbenv global 3.3.0
     ```

4. **Install Docker Desktop**
   - Download and install Docker Desktop for Windows from the [official website](https://www.docker.com/products/docker-desktop/)
   - Ensure it's configured to work with WSL

5. **Set Up the Project**
   - Navigate to your project directory in WSL:
     ```bash
     cd /path/to/project
     ```
   - Start the PostgreSQL database with Docker Compose:
     ```bash
     docker-compose up -d
     ```
   - Fix line ending issues in scripts (if they exist):
     ```bash
     sed -i 's/\r$//' bin/*
     ```
   - Run the setup script:
     ```bash
     bin/setup
     ```
   - Start the development server:
     ```bash
     bin/dev
     ```

6. **Access the Application**
   - Once the server is running, access the application at http://localhost:3000

## Loading Sample Data

If you need to populate the store with sample products, categories, and other test data, run the following command:

```bash
bin/rails spree_sample:load
```

This will add demo products, variants, option types, and other e-commerce data to your development environment, which is useful for:
- Testing the application functionality
- Developing and testing automated tests
- Exploring the features of the Spree Commerce platform
- Demonstrating the application to stakeholders

Note: Sample data is automatically loaded when you run `bin/setup` as we have made chnages to setup file, but you can use this command if you need to reload it later.

Images will not be shown for above sample data, we can add them via the admin panel (Username : spree@example.com, Password: spree123)
I have added a few images and will be commiting them in the repo for ease of validation.

## Deployment

Please follow [Deployment guide](https://spreecommerce.org/docs/developer/deployment/render) to quickly deploy your production-ready Spree application.

## Troubleshooting

### libvips error

If you encounter an error like the following:

```bash
LoadError: Could not open library 'vips.so.42'
```

Please check that libvips is installed with `vips -v`, and if it is not installed, follow [installation instructions here](https://www.libvips.org/install.html).
