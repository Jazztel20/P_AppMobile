namespace ReadMe.Views;

public partial class HomePage : ContentPage
{
	public HomePage()
	{
		InitializeComponent();
	}

	private async void OnNavigateToEBookPageClicked(object sender, EventArgs e)
	{
		await Shell.Current.GoToAsync("//books");
	}
}