
using ReadMe.Views;

namespace ReadMe
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();

            Routing.RegisterRoute("BookInfoPage", typeof(BookInfoPage));
            Routing.RegisterRoute("ReadBookPage", typeof(ReadBookPage));
        }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            return new Window(new AppShell());
        }
    }
}