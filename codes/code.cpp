/*Coded by Prathamesh Shiralkar (pnshiralkar)*/

#include <iostream>
#include <cmath>

#define ll long long
#define endl "\n";
#define mod 1000000007

using namespace std;

int main()
{
	ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout.tie(NULL);
    int t;
    cin >> t;
    
    while(t--)
    {
        long n,sum=0,se1=0,so1=0,se2=0,so2=0;
        cin >> n;
        for(int i=0;i<n;i++)
        {
            long tmp;
            cin >> tmp;
            sum += tmp;
            if(tmp%2)
                so1++;
            else
                se1++;
        }
        for(int i=0;i<n;i++)
        {
            long tmp;
            cin >> tmp;
            sum += tmp;
            if(tmp%2)
                so2++;
            else
                se2++;
        }
        cout << sum/2-((abs(se1-se2))/2+(abs(so2-so1))/2)/2 << endl;
        
    }

    return 0;
}